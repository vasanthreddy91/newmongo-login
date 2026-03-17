pipeline {
    agent any

    stages {

        stage('Check Containers') {
            steps {
                echo 'Checking existing containers...'
                bat 'docker ps -a'
            }
        }

        stage('Start Mongo Container') {
            steps {
                echo 'Starting mongo container...'
                bat 'docker start mongo || echo mongo already running or not exists'
            }
        }

        stage('Start HRMS Container') {
            steps {
                echo 'Starting hrms container...'
                bat 'docker start hrms || echo hrms already running or not exists'
            }
        }

        stage('Verify Running Containers') {
            steps {
                echo 'Verifying running containers...'
                bat 'docker ps'
            }
        }

    }

    post {
        success {
            echo '✅ Containers started successfully (hrms & mongo)'
        }
        failure {
            echo '❌ Pipeline failed'
        }
    }
}