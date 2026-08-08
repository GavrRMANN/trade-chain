package httpapi

import (
	"io"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
	"trade-chain/internal/auth"
	"trade-chain/internal/domain"
	"trade-chain/internal/service"
	"uuid"

	"github.com/go-chi/chi/v5"
)

type productHandler struct{ s service.ProductService }

func mountProductRoutes(r chi.Router, s service.ProductService) {
	h := productHandler{s}

	r.Route("/products", func(r chi.Router) {
		// Публичные маршруты
		r.Get("/", h.list)
		r.Get("/{productID}", h.get)

		// Защищенные маршруты
		r.Group(func(r chi.Router) {
			r.Use(auth.AuthMiddleware)

			// Создать объявление
			r.Post("/", h.create)

			// Изменить своё объявление
			r.Patch("/{productID}", h.update)

			r.Post("/{productID}/image", h.uploadImage)

			// Снять товар с обмена
			//r.Post("/{productID}/archive", h.archive)

			// Задать, что владелец хочет получить
			//r.Put("/{productID}/wishlist", h.updateWishlist)

			// Подходящие прямые товары
			//r.Get("/{productID}/recommendations", h.recommendations)
		})
	})
}

// create godoc
// @Summary Create product
// @Description Create a new product listing
// @Tags products
// @Accept json
// @Produce json
// @Param request body domain.CreateProductDTO true "Product data"
// @Success 201 {object} domain.Product
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /products [post]
func (h productHandler) create(w http.ResponseWriter, r *http.Request) {
	var v domain.CreateProductDTO
	if decodeJSON(r, &v) != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	out, e := h.s.Create(r.Context(), &v)
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusCreated, out)
}

// get godoc
// @Summary Get product by ID
// @Description Get product details
// @Tags products
// @Accept json
// @Produce json
// @Param id path string true "Product ID"
// @Success 200 {object} domain.Product
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /products/{id} [get]
func (h productHandler) get(w http.ResponseWriter, r *http.Request) {
	v, e := h.s.GetByID(r.Context(), chi.URLParam(r, "productID"))
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, v)
}

// update godoc
// @Summary Update product
// @Description Update product information
// @Tags products
// @Accept json
// @Produce json
// @Param id path string true "Product ID"
// @Param request body domain.UpdateProductDTO true "Updated product data"
// @Success 200 {object} domain.Product
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /products/{id} [patch]
func (h productHandler) update(w http.ResponseWriter, r *http.Request) {
	var v domain.UpdateProductDTO
	if decodeJSON(r, &v) != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	out, e := h.s.Update(r.Context(), chi.URLParam(r, "productID"), &v)
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, out)
}

// delete godoc
// @Summary Delete product
// @Description Soft delete product (set status to archived)
// @Tags products
// @Accept json
// @Produce json
// @Param id path string true "Product ID"
// @Success 204 "No content"
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /products/{id} [delete]
func (h productHandler) delete(w http.ResponseWriter, r *http.Request) {
	if e := h.s.Delete(r.Context(), chi.URLParam(r, "productID")); e != nil {
		writeError(w, e)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// list godoc
// @Summary List and search products
// @Description Get product catalog with pagination and optional text/category search
// @Tags products
// @Accept json
// @Produce json
// @Param q query string false "Search query"
// @Param category_id query string false "Category ID"
// @Param q query string false "Search query"
// @Param category_id query string false "Category ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20) maximum(100)
// @Success 200 {array} domain.Product
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /products [get]
func (h productHandler) list(w http.ResponseWriter, r *http.Request) {
	page, limit, err := pagination(r)
	if err != nil {
		writeError(w, err)
		return
	}

	q := strings.TrimSpace(r.URL.Query().Get("q"))

	categoryID := strings.TrimSpace(r.URL.Query().Get("category_id"))

	var category *string
	if categoryID != "" {
		category = &categoryID
	}

	products, err := h.s.List(
		r.Context(),
		q,
		category,
		page,
		limit,
	)
	if err != nil {
		writeError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, products)
}

// byCustomer godoc
// @Summary Get products by customer
// @Description Get all products owned by a customer
// @Tags products
// @Accept json
// @Produce json
// @Param customerID path string true "Customer ID"
// @Success 200 {array} domain.Product
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /products/by-customer/{customerID} [get]
func (h productHandler) byCustomer(w http.ResponseWriter, r *http.Request) {
	v, e := h.s.GetByCustomerID(r.Context(), chi.URLParam(r, "customerID"))
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, v)
}

// uploadImage godoc
// @Summary Upload image for product
// @Description Upload an image for a specific product
// @Tags products
// @Accept multipart/form-data
// @Produce json
// @Param productID path string true "Product ID"
// @Param image formData file true "Image file"
// @Success 200 {object} domain.Product
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /products/{productID}/images [post]
func (h productHandler) uploadImage(w http.ResponseWriter, r *http.Request) {
	// 1. Получаем ID пользователя из контекста (уже есть auth)
	userID, ok := auth.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, service.ErrForbidden)
		return
	}

	productID := chi.URLParam(r, "productID")
	if productID == "" {
		writeError(w, service.ErrInvalidInput)
		return
	}

	// 2. Получаем продукт, чтобы проверить владельца
	product, err := h.s.GetByID(r.Context(), productID)
	if err != nil {
		writeError(w, err)
		return
	}
	if product.CustomerID != userID {
		writeError(w, service.ErrForbidden)
		return
	}

	// 3. Читаем файл из запроса (максимум 5 МБ)
	err = r.ParseMultipartForm(10 << 20) // 5 MB
	if err != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	file, header, err := r.FormFile("image") // имя поля должно быть "image"
	if err != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	defer file.Close()

	// 4. Проверяем тип файла (MIME)
	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil {
		writeError(w, service.ErrInvalidInput)
		return
	}
	mimeType := http.DetectContentType(buffer)
	// Разрешаем только изображения
	if !strings.HasPrefix(mimeType, "image/") {
		writeError(w, service.ErrInvalidInput)
		return
	}
	// Возвращаем указатель в начало файла
	_, err = file.Seek(0, io.SeekStart)
	if err != nil {
		writeError(w, service.ErrInternal)
		return
	}

	// 5. Генерируем уникальное имя файла
	ext := path.Ext(header.Filename)
	if ext == "" {
		// Если расширения нет, можно по MIME определить
		switch mimeType {
		case "image/jpeg":
			ext = ".jpg"
		case "image/png":
			ext = ".png"
		case "image/gif":
			ext = ".gif"
		default:
			ext = ".bin"
		}
	}
	newFileName := uuid.New().String() + ext
	savePath := filepath.Join("./uploads", newFileName)

	// 6. Сохраняем файл
	outFile, err := os.Create(savePath)
	if err != nil {
		writeError(w, service.ErrInternal)
		return
	}
	defer outFile.Close()
	_, err = io.Copy(outFile, file)
	if err != nil {
		writeError(w, service.ErrInternal)
		return
	}

	// 7. Обновляем продукт: записываем относительный путь
	imageURL := "/uploads/" + newFileName
	updateDTO := &domain.UpdateProductDTO{
		Image: &imageURL,
	}
	updated, err := h.s.Update(r.Context(), productID, updateDTO)
	if err != nil {
		// Если обновление не удалось, можно удалить загруженный файл (опционально)
		os.Remove(savePath)
		writeError(w, err)
		return
	}

	// 8. Возвращаем обновлённый продукт
	writeJSON(w, http.StatusOK, updated)
}
