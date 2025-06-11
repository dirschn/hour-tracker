class CreateTimeEntries < ActiveRecord::Migration[8.0]
  def change
    create_table :time_entries do |t|
      t.references :user_position, null: false, foreign_key: true
      t.integer :minutes_worked
      t.date :date

      t.timestamps
    end
  end
end
