pipeline {
    agent any

    stages {

        stage('Cleanup Unwanted Containers') {
            steps {
                echo 'Removing unwanted containers...'
                bat 'for /f %i in (\'docker ps -a -q --filter ancestor=vasanthreddyo07/newmongo-login:latest\') do docker rm -f %i'
            }
        }

        stage('Check Containers') {
            steps {
                echo 'Checking existing containers...'
                bat 'docker ps -a'
            }
        }

        stage('Start Mongo') {
            steps {
                bat 'docker start mongo || echo mongo already running or not exists'
            }
        }

        stage('Start HRMS') {
            steps {
                bat 'docker start hrms || echo hrms already running or not exists'
            }
        }

        stage('Final Status') {
            steps {
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