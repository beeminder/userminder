import { Controller } from "stimulus"

export default class extends Controller {
  static targets = [ "link" ]

  connect() {
    if (document.queryCommandSupported("copy")) {
      this.element.classList.add("clipboard--supported")
    }
  }

  copy() {
    this.linkTarget.select()
    document.execCommand("copy")
  }

}