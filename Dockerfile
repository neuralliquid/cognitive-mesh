# syntax=docker/dockerfile:1

# ------------------------------------------------------------------
# Stage 1: Build
# ------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy the full source before restore because the solution references nested projects.
COPY . .

# Restore NuGet packages
RUN dotnet restore CognitiveMesh.sln

# Build in Release mode
RUN dotnet build CognitiveMesh.sln -c Release --no-restore

# Publish the runtime project (configurable via build arg)
ARG PUBLISH_PROJECT=src/ApiHost/ApiHost.csproj
RUN dotnet publish "${PUBLISH_PROJECT}" -c Release --no-restore -o /app/publish

# ------------------------------------------------------------------
# Stage 2: Runtime
# ------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Create non-root user for security
RUN useradd --create-home --shell /usr/sbin/nologin appuser

# Copy published output
COPY --from=build /app/publish .

# Configurable entrypoint DLL name
ENV ENTRYPOINT_DLL="ApiHost.dll"

# Expose default ASP.NET Core port
EXPOSE 8080

# Switch to non-root user
USER appuser

ENTRYPOINT ["sh", "-c", "dotnet ${ENTRYPOINT_DLL}"]
