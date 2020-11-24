# Build all images
docker build -t dilipl/multi-client:latest -t dilipl/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t dilipl/multi-server:latest -t dilipl/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t dilipl/multi-worker:latest -t dilipl/multi-worker:$SHA -f ./worker/Dockerfile ./worker
# Push them to dockerhub. We are already logged into docker in travis
docker push dilipl/multi-client:latest
docker push dilipl/multi-client:$SHA
docker push dilipl/multi-server:latest
docker push dilipl/multi-server:$SHA
docker push dilipl/multi-worker:latest
docker push dilipl/multi-worker:$SHA
#Apply to K8s cluster. We are already logged in and have specified all info in travis.yml
kubectl apply -f k8s
# Deploy the latest
kubectl set image deployments/server-deployment.yml server=dilipl/multi-server:$SHA
kubectl set image deployments/client-deployment.yml client=dilipl/multi-client:$SHA
kubectl set image deployments/worker-deployment.yml worker=dilipl/multi-worker:$SHA
