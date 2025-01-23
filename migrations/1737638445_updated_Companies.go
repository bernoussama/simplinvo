package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_1688129025")
		if err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(12, []byte(`{
			"hidden": false,
			"id": "file1431215880",
			"maxSelect": 1,
			"maxSize": 0,
			"mimeTypes": [
				"image/png",
				"image/vnd.mozilla.apng"
			],
			"name": "stamp",
			"presentable": false,
			"protected": false,
			"required": false,
			"system": false,
			"thumbs": [],
			"type": "file"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_1688129025")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("file1431215880")

		return app.Save(collection)
	})
}
