class CreatePositions < ActiveRecord::Migration[8.0]
  def change
    create_table :positions do |t|
      t.string :title
      t.text :description
      t.references :company, null: false, foreign_key: true
      t.boolean :remote, default: true

      t.index [:title, :company_id], unique: true

      t.timestamps
    end
  end
end
