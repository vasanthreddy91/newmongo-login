pipeline {
    agent any
    stages {
        stage('Check Containers') {
            steps {
                echo 'Checking existing containers...'
                sh 'docker ps -a'
            }
        }
        stage('Start Mongo') {
            steps {
                echo 'Starting mongo container...'
                sh 'docker start mongo || echo "mongo already running or not exists"'
            }
        }
        stage('Start HRMS') {
            steps {
                echo 'Starting hrms container...'
                sh 'docker start hrms || echo "hrms already running or not exists"'
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
            echo '✅ Only hrms & mongo are running'
        }
        failure {
            echo '❌ Pipeline failed'
        }
    }
}
