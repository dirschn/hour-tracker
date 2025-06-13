require "rails_helper"

RSpec.describe EmploymentsController, type: :routing do
  describe "routing" do
    it "routes to #index" do
      expect(get: "/employments").to route_to("employments#index")
    end

    it "routes to #show" do
      expect(get: "/employments/1").to route_to("employments#show", id: "1")
    end


    it "routes to #create" do
      expect(post: "/employments").to route_to("employments#create")
    end

    it "routes to #update via PUT" do
      expect(put: "/employments/1").to route_to("employments#update", id: "1")
    end

    it "routes to #update via PATCH" do
      expect(patch: "/employments/1").to route_to("employments#update", id: "1")
    end

    it "routes to #destroy" do
      expect(delete: "/employments/1").to route_to("employments#destroy", id: "1")
    end
  end
end
