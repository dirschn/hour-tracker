class DashboardController < ApplicationController
  def show
    @time_entries = TimeEntry.order(created_at: :desc).limit(5)
  end
end
