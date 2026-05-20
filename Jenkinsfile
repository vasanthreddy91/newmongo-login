  pipeline {
    agent any
    stages {
        stage('Setup Network') {
            steps {
                echo 'Creating Docker network if not exists...'
                sh 'docker network create hrms-net || true'
            }
        }
        stage('Build HRMS Image') {
            steps {
                echo 'Building HRMS image from source...'
                sh 'docker build -t hrms-app:latest .'
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
                        hrms-app:latest
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
            echo ' App running at http://192.168.60.152:3000'
        }
        failure {
            echo ' Pipeline failed — check logs above'
        }
    }
}
