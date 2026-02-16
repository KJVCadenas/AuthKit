package cmd

import (
	"fmt"
	"os"

	"github.com/authkit/cli/internal"
	"github.com/spf13/cobra"
)

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List available AuthKit templates",
	Run: func(cmd *cobra.Command, args []string) {
		templates, err := internal.DiscoverTemplates()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error discovering templates: %v\n", err)
			os.Exit(1)
		}
		fmt.Println("Available templates:")
		for _, t := range templates {
			fmt.Printf("- %s: %s\n", t.Name, t.Description)
		}
	},
}

func init() {
	rootCmd.AddCommand(listCmd)
}
