# christopher.leggett.link

A personal website project that provides information about myself as well as a
playground for learning new technologies.

##Initial Setup
1. Setup Domain In Route 53
1. Create Backend Bucket (e.g aws s3 mb s3://christopher.leggett.link-backend)
1. Deploy Project
1. Validate CloudFront Certificate

##Deploy
gulp deploy
ENV_PROPERTIES=prod gulp deploy

##Run Local
gulp run
ENV_PROPERTIES=prod gulp run