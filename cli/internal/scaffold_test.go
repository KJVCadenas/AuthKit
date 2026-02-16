package internal

import (
	"os"
	"path/filepath"
	"testing"
)

func TestCopyDirAndRunInit_InvalidProjectName(t *testing.T) {
	templates, err := DiscoverTemplates()
	if err != nil || len(templates) == 0 {
		t.Skip("No templates to test copyDir")
	}
	tpl := templates[0]
	dir := t.TempDir()
	existingDir := filepath.Join(dir, "existing")
	os.Mkdir(existingDir, 0755)
	// Make directory non-empty
	f, err := os.Create(filepath.Join(existingDir, "dummy.txt"))
	if err != nil {
		t.Fatalf("Failed to create dummy file: %v", err)
	}
	f.Close()
	err = copyDir(tpl.Path, existingDir, "existing")
	if err == nil {
		t.Error("Expected error when copying to existing directory, got nil")
	}
}
