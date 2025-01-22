// Package ui handles the frontend embedding.
package ui

import (
	"embed"
	"io/fs"
)

//go:embed all:build/client
var distDir embed.FS

// DistDirFS contains the embedded dist directory files (without the "dist" prefix)
var DistDirFS, _ = fs.Sub(distDir, "build/client")
