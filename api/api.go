package api

import (
	"net/http"

	"github.com/pocketbase/pocketbase/core"
)

func Test(e *core.RequestEvent) error {
	return e.String(http.StatusOK, "hello world")
}
