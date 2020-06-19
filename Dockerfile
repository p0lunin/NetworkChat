FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS base-back
WORKDIR /app

FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build-back
WORKDIR /src

COPY ["backend/NetworkChat/NetworkChat.csproj", "NetworkChat/"]
RUN dotnet restore "NetworkChat/NetworkChat.csproj"

COPY ./backend .

WORKDIR "/src/NetworkChat"
RUN dotnet build "NetworkChat.csproj" -c Release -o /app

FROM build-back AS publish
RUN dotnet publish "NetworkChat.csproj" -c Release -o /app

FROM node:12 AS front
COPY ./frontend/package.json /src/front/
WORKDIR /src/front
RUN ["npm", "install"]

COPY ./frontend /src/front
RUN ["npm", "run-script", "build"]

FROM base-back

WORKDIR /app
COPY --from=publish /app .
WORKDIR /app/wwwroot
COPY --from=front /src/front/build .

EXPOSE 80
WORKDIR /app
ENTRYPOINT ["dotnet", "NetworkChat.dll"]
