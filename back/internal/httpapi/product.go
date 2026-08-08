package httpapi

import (
	"net/http"
	"strings"
	"trade-chain/internal/auth"
	"trade-chain/internal/domain"
	"trade-chain/internal/service"

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
	v, e := h.s.GetByID(r.Context(), chi.URLParam(r, "id"))
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
	out, e := h.s.Update(r.Context(), chi.URLParam(r, "id"), &v)
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, out)
}

// delete godoc
// @Summary Delete product
// @Description Soft delete product (set is_active=false)
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
	if e := h.s.Delete(r.Context(), chi.URLParam(r, "id")); e != nil {
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
// @Param offset query int false "Offset" default(0)
// @Param limit query int false "Limit" default(20) maximum(100)
// @Success 200 {array} domain.Product
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /products [get]
func (h productHandler) list(w http.ResponseWriter, r *http.Request) {
	offset, limit, err := pagination(r)
	if err != nil {
		writeError(w, err)
		return
	}

	q := strings.TrimSpace(r.URL.Query().Get("q"))
	categoryID := strings.TrimSpace(r.URL.Query().Get("category_id"))

	var products []domain.Product

	if q != "" || categoryID != "" {
		var category *string
		if categoryID != "" {
			category = &categoryID
		}

		products, err = h.s.Search(r.Context(), q, category)
	} else {
		// Обычный каталог.
		products, err = h.s.List(r.Context(), offset, limit)
	}

	if err != nil {
		writeError(w, err)
		return
	}

	if q != "" || categoryID != "" {
		if offset >= len(products) {
			products = []domain.Product{}
		} else {
			end := offset + limit
			if end > len(products) {
				end = len(products)
			}

			products = products[offset:end]
		}
	}

	writeJSON(w, http.StatusOK, products)
}

// search godoc
// @Summary Search products
// @Description Search products by text query and optionally filter by category
// @Tags products
// @Accept json
// @Produce json
// @Param q query string true "Search query"
// @Param category_id query string false "Category ID"
// @Success 200 {array} domain.Product
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /products/search [get]
func (h productHandler) search(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	var category *string
	if v := r.URL.Query().Get("category_id"); v != "" {
		category = &v
	}
	out, e := h.s.Search(r.Context(), q, category)
	if e != nil {
		writeError(w, e)
		return
	}
	writeJSON(w, http.StatusOK, out)
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
