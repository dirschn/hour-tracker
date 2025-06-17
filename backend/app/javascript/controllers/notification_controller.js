import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    // Auto-dismiss alerts after 5 seconds
    setTimeout(() => {
      this.dismiss()
    }, 5000)
  }

  dismiss() {
    this.element.classList.add('fade')
    setTimeout(() => {
      if (this.element.parentNode) {
        this.element.remove()
      }
    }, 150)
  }
}