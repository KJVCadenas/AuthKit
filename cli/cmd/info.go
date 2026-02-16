package cmd

import (
	"fmt"
	"os"
	"github.com/spf13/cobra"
	"github.com/authkit/cli/internal"
)

var infoCmd = &cobra.Command{
	Use:   "info [template]",
	Short: "Show details for a specific template",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		template, err := internal.GetTemplateInfo(args[0])
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("Name: %s\nDescription: %s\nLanguage: %s\nPath: %s\n", template.Name, template.Description, template.Language, template.Path)
		if template.Readme != "" {
			fmt.Println("\nREADME:")
			fmt.Println(template.Readme)
		}
	},
}

func init() {
	rootCmd.AddCommand(infoCmd)
}
