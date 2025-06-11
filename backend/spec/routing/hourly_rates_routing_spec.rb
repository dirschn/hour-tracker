require "rails_helper"

RSpec.describe HourlyRatesController, type: :routing do
  describe "routing" do
    it "routes to #index" do
      expect(get: "/hourly_rates").to route_to("hourly_rates#index")
    end

    it "routes to #show" do
      expect(get: "/hourly_rates/1").to route_to("hourly_rates#show", id: "1")
    end


    it "routes to #create" do
      expect(post: "/hourly_rates").to route_to("hourly_rates#create")
    end

    it "routes to #update via PUT" do
      expect(put: "/hourly_rates/1").to route_to("hourly_rates#update", id: "1")
    end

    it "routes to #update via PATCH" do
      expect(patch: "/hourly_rates/1").to route_to("hourly_rates#update", id: "1")
    end

    it "routes to #destroy" do
      expect(delete: "/hourly_rates/1").to route_to("hourly_rates#destroy", id: "1")
    end
  end
end
