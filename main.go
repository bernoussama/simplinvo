package main

import (
	"log"
	"os"
	"simplinvo/api"
	_ "simplinvo/migrations"
	"simplinvo/ui"
	"strings"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// loosely check if it was executed using "go run"
		// serves static files from the provided public dir (if exists)
		// se.Router.GET("/{path...}", apis.Static(os.DirFS("./ui/build/client/"), true))

		// serves static files from the embeded public dir (if exists)
		se.Router.GET("/{path...}", apis.Static(ui.DistDirFS, true))

		// se.Router.GET("/locales/{lang}/translation.json", apis.Static(ui.DistDirFS, false))

		apiv1 := se.Router.Group("/api/v1")
		apiv1.GET("/test", api.Test)

		return se.Next()
	})

	isGoRun := strings.HasPrefix(os.Args[0], os.TempDir())

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Dashboard
		// (the isGoRun check is to enable it only during development)
		Automigrate: isGoRun,
	})
	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
