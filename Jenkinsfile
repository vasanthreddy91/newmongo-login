pipeline {
    agent any

    environment {
        APP_NAME = "newmongo-login"
        IMAGE_TAG = "v1"
    }

    stages {

        stage('Install Dependencies') {
            steps {
                echo "Installing Node dependencies..."
                sh 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker Image..."
                sh 'docker build -t newmongo-login:v1 .'
            }
        }

        stage('Run Docker Container') {
            steps {
                echo "Running container..."
                sh '''
                docker rm -f newmongo-container || true
                docker run -d -p 3000:3000 --name newmongo-container newmongo-login:v1
                '''
            }
        }

    }

    post {
        success {
            echo "Pipeline executed successfully"
        }
        failure {
            echo "Pipeline failed"
        }
    }
}
