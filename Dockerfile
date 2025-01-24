# Build frontend
FROM node:23 AS frontend-build

WORKDIR /app
COPY ui/package*.json ./
RUN npm install

COPY ui/ .
RUN npm run build

# Build backend
FROM golang:1.23.3 AS backend-build

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
COPY --from=frontend-build /app/build ./ui/build

RUN CGO_ENABLED=0 go build -o simplinvo .

# Final stage
FROM alpine:3.18

WORKDIR /app
COPY --from=backend-build /app/simplinvo ./
COPY --from=backend-build /app/ui/build ./ui/build

EXPOSE 8090/tcp

ENTRYPOINT ["/app/simplinvo", "serve"]
