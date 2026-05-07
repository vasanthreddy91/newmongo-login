pipeline {
    agent { label 'windows-agent' }

    options {
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Cloning repository...'
                bat '''
                    if exist "C:\\jenkins-agent\\workspace\\HRMS\\.git" (
                        echo Pulling latest changes...
                        cd /d C:\\jenkins-agent\\workspace\\HRMS
                        "C:\\Program Files\\Git\\cmd\\git.exe" pull
                    ) else (
                        echo Cloning fresh...
                        "C:\\Program Files\\Git\\cmd\\git.exe" clone https://github.com/vasanthreddy91/newmongo-login.git C:\\jenkins-agent\\workspace\\HRMS
                    )
                '''
            }
        }

        stage('Setup Network') {
            steps {
                echo 'Creating Docker network if not exists...'
                bat 'docker network create hrms-net 2>nul & exit 0'
            }
        }

        stage('Build HRMS Image') {
            steps {
                echo 'Building HRMS image from source...'
                bat 'cd /d C:\\jenkins-agent\\workspace\\HRMS && docker build -t hrms-app:latest .'
            }
        }

        stage('Start Mongo') {
            steps {
                echo 'Starting mongo container...'
                bat 'docker stop mongo 2>nul & docker rm mongo 2>nul & exit 0'
                bat '''
                    docker run -d ^
                        --name mongo ^
                        --network hrms-net ^
                        -p 27017:27017 ^
                        mongo:latest
                '''
            }
        }

        stage('Start HRMS') {
            steps {
                echo 'Starting HRMS container...'
                bat 'docker stop hrms 2>nul & docker rm hrms 2>nul & exit 0'
                bat '''
                    docker run -d ^
                        --name hrms ^
                        --network hrms-net ^
                        -p 3000:3000 ^
                        -e MONGO_URL=mongodb://mongo:27017/hrms ^
                        hrms-app:latest
                '''
            }
        }

        stage('Final Status') {
            steps {
                echo 'Running containers:'
                bat 'docker ps'
            }
        }
    }

    post {
        success {
            echo 'App running at http://192.168.60.152:3000'
        }
        failure {
            echo 'Pipeline failed - check logs above'
        }
    }
}
