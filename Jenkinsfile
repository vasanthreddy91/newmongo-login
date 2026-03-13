pipeline {
    agent any

    environment {
        APP_NAME = "newmongo-login"
        IMAGE_TAG = "v1"
    }

    stages {

        stage('Clone Repository') {
            steps {
                echo "Cloning GitHub repository..."
                git branch: 'main', url: 'https://github.com/YOUR_USERNAME/newmongo-login.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "Installing Node dependencies..."
                sh 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker Image..."
                sh 'docker build -t $APP_NAME:$IMAGE_TAG .'
            }
        }

        stage('Run Docker Container') {
            steps {
                echo "Running Application Container..."
                sh '''
                docker rm -f newmongo-container || true
                docker run -d -p 3000:3000 --name newmongo-container $APP_NAME:$IMAGE_TAG
                '''
            }
        }

    }

    post {
        success {
            echo "CI/CD Pipeline executed successfully!"
        }

        failure {
            echo "Pipeline failed!"
        }
    }
}
