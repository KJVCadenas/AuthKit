package internal

import (
	"io"
	"os"
	"path/filepath"
	"strings"
)

type Template struct {
	Name        string
	Description string
	Language    string
	Path        string
	Readme      string
}

// DiscoverTemplates scans ../templates for available templates
func DiscoverTemplates() ([]Template, error) {
	templatesDir := filepath.Join("..", "..", "templates")
	entries, err := os.ReadDir(templatesDir)
	if err != nil {
		return nil, err
	}
	var templates []Template
	for _, entry := range entries {
		if entry.IsDir() {
			readmePath := filepath.Join(templatesDir, entry.Name(), "README.md")
			f, err := os.Open(readmePath)
			var readme []byte
			if err == nil {
				readme, _ = io.ReadAll(f)
				f.Close()
			}
			meta := parseReadmeMeta(string(readme))
			templates = append(templates, Template{
				Name:        meta["name"],
				Description: meta["description"],
				Language:    meta["language"],
				Path:        filepath.Join(templatesDir, entry.Name()),
				Readme:      string(readme),
			})
		}
	}
	return templates, nil
}

// GetTemplateInfo returns Template info by name
func GetTemplateInfo(name string) (Template, error) {
	templates, err := DiscoverTemplates()
	if err != nil {
		return Template{}, err
	}
	for _, t := range templates {
		if strings.EqualFold(t.Name, name) || strings.EqualFold(filepath.Base(t.Path), name) {
			return t, nil
		}
	}
	return Template{}, os.ErrNotExist
}

// parseReadmeMeta extracts metadata from README.md frontmatter or fallback
func parseReadmeMeta(readme string) map[string]string {
	meta := map[string]string{"name": "", "description": "", "language": ""}
	lines := strings.Split(readme, "\n")
	for _, line := range lines {
		l := strings.TrimSpace(line)
		lower := strings.ToLower(l)
		switch {
		case strings.HasPrefix(lower, "# "):
			meta["name"] = strings.TrimSpace(l[2:])
		case strings.HasPrefix(lower, "description:"):
			meta["description"] = strings.TrimSpace(l[len("description:"):])
		case strings.HasPrefix(lower, "language:"):
			meta["language"] = strings.TrimSpace(l[len("language:"):])
		}
	}
	return meta
}
