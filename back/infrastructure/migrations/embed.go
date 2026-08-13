// Package migrations отдаёт SQL-файлы, встроенные в бинарь.
//
// Пакет живёт рядом с самими файлами намеренно: go:embed не умеет
// подниматься выше каталога пакета, а копировать SQL во второе место значило
// бы держать два расходящихся сида.
package migrations

import _ "embed"

// SeedMockData — базовый набор демонстрационных данных.
//
//go:embed 006_seed_mock_data.sql
var SeedMockData string

// SeedDemoAccounts — состояния пяти демонстрационных профилей поверх базового набора.
//
//go:embed 013_demo_accounts.sql
var SeedDemoAccounts string
