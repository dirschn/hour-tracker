class CreateShifts < ActiveRecord::Migration[8.0]
  def change
    create_table :shifts do |t|
      t.references :employment, null: false, foreign_key: true
      t.datetime :start_time, null: false
      t.datetime :end_time
      t.text :description
      t.date :date, null: false
      t.text :notes

      t.timestamps
    end
  end
end
