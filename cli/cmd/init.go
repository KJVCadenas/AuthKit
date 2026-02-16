package cmd

import (
	"fmt"
	"os"

	"github.com/authkit/cli/internal"
	"github.com/spf13/cobra"
)

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Scaffold a new AuthKit project from a template",
	Run: func(cmd *cobra.Command, args []string) {
		if err := internal.RunInit(); err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}
	},
}

func init() {
	rootCmd.AddCommand(initCmd)
}
