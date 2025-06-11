require "rails_helper"

RSpec.describe UserPositionsController, type: :routing do
  describe "routing" do
    it "routes to #index" do
      expect(get: "/user_positions").to route_to("user_positions#index")
    end

    it "routes to #show" do
      expect(get: "/user_positions/1").to route_to("user_positions#show", id: "1")
    end


    it "routes to #create" do
      expect(post: "/user_positions").to route_to("user_positions#create")
    end

    it "routes to #update via PUT" do
      expect(put: "/user_positions/1").to route_to("user_positions#update", id: "1")
    end

    it "routes to #update via PATCH" do
      expect(patch: "/user_positions/1").to route_to("user_positions#update", id: "1")
    end

    it "routes to #destroy" do
      expect(delete: "/user_positions/1").to route_to("user_positions#destroy", id: "1")
    end
  end
end
