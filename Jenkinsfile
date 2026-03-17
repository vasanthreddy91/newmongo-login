pipeline {
    agent any

    stages {

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node dependencies...'
                bat 'npm install'
            }
        }

        stage('Pull Docker Image') {
            steps {
                echo 'Pulling image from Docker Hub...'
                bat 'docker pull vasanthreddyo07/newmongo-login:latest'
            }
        }

        stage('Run Docker Container') {
            steps {
                echo 'Stopping old container if exists...'
                bat 'docker stop newmongo-container || echo not running'
                bat 'docker rm newmongo-container || echo not exists'

                echo 'Running container...'
                bat 'docker run -d -p 3000:3000 --name newmongo-container vasanthreddyo07/newmongo-login:latest'
            }
        }

    }

    post {
        success {
            echo 'Pipeline executed successfully'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}