pipeline {
    agent any
    stages {
        stage('Setup Network') {
            steps {
                echo 'Creating Docker network if not exists...'
                sh 'docker network create hrms-net || true'
            }
        }
        stage('Pull Images') {
            steps {
                echo 'Pulling latest images from Docker Hub...'
                sh 'docker pull vasanthreddy91/newmongo-login:latest'
                sh 'docker pull mongo:latest'
            }
        }
        stage('Start Mongo') {
            steps {
                echo 'Starting mongo container...'
                sh '''
                    docker stop mongo || true
                    docker rm mongo || true
                    docker run -d \
                        --name mongo \
                        --network hrms-net \
                        -p 27017:27017 \
                        mongo:latest
                '''
            }
        }
        stage('Start HRMS') {
            steps {
                echo 'Starting HRMS container...'
                sh '''
                    docker stop hrms || true
                    docker rm hrms || true
                    docker run -d \
                        --name hrms \
                        --network hrms-net \
                        -p 3000:3000 \
                        -e MONGO_URL=mongodb://mongo:27017/hrms \
                        vasanthreddy91/newmongo-login:latest
                '''
            }
        }
        stage('Final Status') {
            steps {
                echo 'Running containers:'
                sh 'docker ps'
            }
        }
    }
    post {
        success {
            echo '✅ App running at http://localhost:3000'
        }
        failure {
            echo '❌ Pipeline failed — check logs above'
        }
    }
}
