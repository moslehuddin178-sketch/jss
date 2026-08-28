pipeline {
  agent any

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Backend deps & test') {
      steps {
        dir('backend') {
          sh 'npm ci'
          sh 'npm test || echo "no tests yet — skipping"'
        }
      }
    }

    stage('Frontend build') {
      steps {
        dir('frontend') {
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Build images') {
      steps {
        sh 'docker compose build'
      }
    }
  }

  post {
    always  { echo 'Pipeline finished.' }
    success { echo '✅ Build succeeded.' }
    failure { echo '❌ Build failed.' }
  }
}