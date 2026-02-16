package internal

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// RunInit handles the interactive project scaffolding
func RunInit() error {
	templates, err := DiscoverTemplates()
	if err != nil {
		return fmt.Errorf("could not discover templates: %w", err)
	}
	if len(templates) == 0 {
		return fmt.Errorf("no templates found")
	}
	fmt.Println("Select a template:")
	for i, t := range templates {
		fmt.Printf("[%d] %s (%s)\n", i+1, t.Name, t.Language)
	}
	fmt.Print("Enter number: ")
	var choice int
	_, err = fmt.Scanf("%d\n", &choice)
	if err != nil || choice < 1 || choice > len(templates) {
		return fmt.Errorf("invalid selection")
	}
	template := templates[choice-1]
	reader := bufio.NewReader(os.Stdin)
	fmt.Print("Project name: ")
	projectName, _ := reader.ReadString('\n')
	projectName = strings.TrimSpace(projectName)
	if projectName == "" {
		return fmt.Errorf("project name cannot be empty")
	}
	targetDir := filepath.Join(".", projectName)
	if _, err := os.Stat(targetDir); err == nil {
		return fmt.Errorf("directory '%s' already exists", targetDir)
	}
	fmt.Printf("Scaffolding %s into %s...\n", template.Name, targetDir)
	err = copyDir(template.Path, targetDir, projectName)
	if err != nil {
		return fmt.Errorf("failed to copy template: %w", err)
	}
	fmt.Println("Project scaffolded successfully.")
	fmt.Println("\nNext steps:")
	fmt.Printf("cd %s\n", projectName)
	fmt.Println("Follow the README.md for setup instructions.")
	return nil
}

// copyDir copies template files, replacing placeholders
func copyDir(src, dst, projectName string) error {
	// Check if dst exists and is not empty
	if fi, err := os.Stat(dst); err == nil && fi.IsDir() {
		f, err := os.Open(dst)
		if err != nil {
			return err
		}
		defer f.Close()
		names, err := f.Readdirnames(1)
		if err == nil && len(names) > 0 {
			return fmt.Errorf("destination directory '%s' already exists and is not empty", dst)
		}
	}
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(src, path)
		target := filepath.Join(dst, rel)
		if info.IsDir() {
			return os.MkdirAll(target, 0755)
		}
		in, err := os.Open(path)
		if err != nil {
			return err
		}
		defer in.Close()
		out, err := os.Create(target)
		if err != nil {
			return err
		}
		defer out.Close()
		scanner := bufio.NewScanner(in)
		for scanner.Scan() {
			line := strings.ReplaceAll(scanner.Text(), "{{PROJECT_NAME}}", projectName)
			_, err := out.WriteString(line + "\n")
			if err != nil {
				return err
			}
		}
		return scanner.Err()
	})
}
