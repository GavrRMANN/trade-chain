package repository

import (
	"strings"
	"testing"
)

// Рекурсивный запрос в GetFullChain объединяет две выборки, и Postgres требует
// от них одинакового состава колонок. Раньше вторая была набрана руками и
// разъезжалась с первой при каждом новом поле — здесь она выводится из первой,
// и проверка сторожит именно это.
func TestChainColumnsKeepBothUnionBranchesInStep(t *testing.T) {
	plain := strings.Split(chainColumns, ",")
	prefixed := strings.Split(chainColumnsOf("c"), ",")

	if len(prefixed) != len(plain) {
		t.Fatalf("колонок с префиксом %d, в исходном списке %d", len(prefixed), len(plain))
	}

	for i, column := range prefixed {
		want := "c." + strings.TrimSpace(plain[i])
		if strings.TrimSpace(column) != want {
			t.Errorf("колонка %q, ожидалась %q", column, want)
		}
	}
}
