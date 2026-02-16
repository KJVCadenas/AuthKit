package internal

import (
	"testing"
)

func TestDiscoverTemplates(t *testing.T) {
	templates, err := DiscoverTemplates()
	if err != nil {
		t.Fatalf("DiscoverTemplates failed: %v", err)
	}
	if len(templates) == 0 {
		t.Error("Expected at least one template, got 0")
	}
	for _, tpl := range templates {
		if tpl.Name == "" {
			t.Error("Template name should not be empty")
		}
		if tpl.Path == "" {
			t.Error("Template path should not be empty")
		}
	}
}

func TestGetTemplateInfo(t *testing.T) {
	templates, err := DiscoverTemplates()
	if err != nil || len(templates) == 0 {
		t.Skip("No templates to test GetTemplateInfo")
	}
	name := templates[0].Name
	tpl, err := GetTemplateInfo(name)
	if err != nil {
		t.Fatalf("GetTemplateInfo failed: %v", err)
	}
	if tpl.Name != name {
		t.Errorf("Expected name %s, got %s", name, tpl.Name)
	}
}

func TestParseReadmeMeta(t *testing.T) {
	readme := "# MyTemplate\nDescription: Example\nLanguage: Go\n"
	meta := parseReadmeMeta(readme)
	if meta["name"] != "MyTemplate" {
		t.Errorf("Expected name MyTemplate, got %s", meta["name"])
	}
	if meta["description"] != "Example" {
		t.Errorf("Expected description Example, got %s", meta["description"])
	}
	if meta["language"] != "Go" {
		t.Errorf("Expected language Go, got %s", meta["language"])
	}
}
