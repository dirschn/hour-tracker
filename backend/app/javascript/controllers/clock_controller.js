import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["button"]
  static values = { action: String }

  connect() {
    this.originalText = this.buttonTarget.textContent
  }

  submitStart() {
    this.buttonTarget.disabled = true
    this.buttonTarget.innerHTML = this.loadingText()
  }

  submitEnd() {
    this.buttonTarget.disabled = false
    this.buttonTarget.textContent = this.originalText
  }

  loadingText() {
    const action = this.actionValue || "Processing"
    return `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${action}...`
  }
}