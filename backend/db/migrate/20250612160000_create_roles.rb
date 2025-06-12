class CreateRoles < ActiveRecord::Migration[6.1]
  def change
    create_table :roles do |t|
      t.string :name, null: false
      t.text :description
      t.references :company, null: false, foreign_key: true
      t.timestamps
    end
    add_index :roles, [:name, :company_id], unique: true
  end
end
