package internal

import (
	"fmt"
	"os/exec"
)

// CheckEnv validates required tools for a template
func CheckEnv(requirements []string) error {
	for _, tool := range requirements {
		if _, err := exec.LookPath(tool); err != nil {
			return fmt.Errorf("required tool '%s' not found in PATH", tool)
		}
	}
	return nil
}
