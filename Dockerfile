# Use lightweight Linux
FROM alpine:latest

# Install dependencies
RUN apk add --no-cache unzip curl

# Download PocketBase
RUN curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip -o pb.zip \
    && unzip pb.zip \
    && chmod +x pocketbase \
    && rm pb.zip

# Expose port
EXPOSE 8090

# Start PocketBase
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8090"]