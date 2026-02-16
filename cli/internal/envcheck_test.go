package internal

import (
	"testing"
)

func TestCheckEnv_Success(t *testing.T) {
	// 'go' should exist in dev env
	err := CheckEnv([]string{"go"})
	if err != nil {
		t.Errorf("Expected no error for existing tool, got %v", err)
	}
}

func TestCheckEnv_Missing(t *testing.T) {
	err := CheckEnv([]string{"definitelynotatool12345"})
	if err == nil {
		t.Error("Expected error for missing tool, got nil")
	}
}
