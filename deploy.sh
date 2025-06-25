if [ -z "$1" ]; then
  echo "Provide NODE_ENV parameter as follows './deploy.sh {your_env}'"
  exit 1
fi

NODE_ENV=$1
ENV_FILE=".env.${NODE_ENV}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Environment file $ENV_FILE does not exist."
  exit 1
fi

export $(grep -v '^#' "$ENV_FILE" | xargs)
npm install

npm run build

docker-compose --env-file "$ENV_FILE" -p youcoinapp-backend down
docker-compose --env-file "$ENV_FILE" -p youcoinapp-backend build
docker-compose --env-file "$ENV_FILE" -p youcoinapp-backend up -d

docker image prune -f