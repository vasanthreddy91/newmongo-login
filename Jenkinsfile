pipeline {
    agent any

    stages {

        stage('Check Containers') {
            steps {
                echo 'Checking existing containers...'
                bat 'docker ps -a'
            }
        }

        stage('Start Mongo') {
            steps {
                echo 'Starting mongo container...'
                bat 'docker start mongo || echo mongo already running or not exists'
            }
        }

        stage('Start HRMS') {
            steps {
                echo 'Starting hrms container...'
                bat 'docker start hrms || echo hrms already running or not exists'
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
            echo '✅ Only hrms & mongo are running'
        }
        failure {
            echo '❌ Pipeline failed'
        }
    }
}