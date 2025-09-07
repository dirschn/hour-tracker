class AddRoundModeAndRoundIntervalToEmployment < ActiveRecord::Migration[8.0]
  def change
    add_column :employments, :round_mode, :integer, default: 0, null: false
    add_column :employments, :round_interval, :integer
  end
end
