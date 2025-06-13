class CreateEmployments < ActiveRecord::Migration[8.0]
  def change
    create_table :employments do |t|
      t.references :user, null: false, foreign_key: true
      t.references :position, null: false, foreign_key: true
      t.date :start_date, null: false
      t.date :end_date

      t.timestamps
    end
  end
end
