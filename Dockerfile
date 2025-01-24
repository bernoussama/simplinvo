# Build frontend
FROM --platform=$BUILDPLATFORM node:23-alpine AS frontend-build

WORKDIR /app
COPY ui/package*.json ./
RUN npm install

COPY ui/ .
RUN npm run build

# Build backend
FROM --platform=$BUILDPLATFORM golang:1.23.3-alpine AS backend-build

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
COPY --from=frontend-build /app/build ./ui/build

ARG TARGETARCH
RUN CGO_ENABLED=0 GOOS=linux GOARCH=$TARGETARCH go build -o simplinvo .

# Final stage
FROM alpine:3.18

WORKDIR /app
COPY --from=backend-build /app/simplinvo ./
COPY --from=backend-build /app/ui/build ./ui/build

EXPOSE 8090

ENTRYPOINT ["/app/simplinvo", "serve", "--http=0.0.0.0:8090"]
