FROM jrottenberg/ffmpeg:3.3-alpine
FROM node:16-alpine

# copy ffmpeg bins from first image
COPY --from=0 / /