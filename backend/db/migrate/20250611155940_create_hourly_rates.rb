class CreateHourlyRates < ActiveRecord::Migration[8.0]
  def change
    create_table :hourly_rates do |t|
      t.references :user_position, null: false, foreign_key: true
      t.integer :rate_cents

      t.timestamps
    end
  end
end
