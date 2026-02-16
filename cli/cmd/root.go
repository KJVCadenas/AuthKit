package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "authkit",
	Short: "AuthKit CLI for scaffolding secure authentication backends.",
	Long: `AuthKit CLI

Scaffold secure, production-ready authentication backends in multiple languages/frameworks.
`,
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
