using System;
using System.Collections.Generic;

namespace ProductApp_.NET_8.Models;

public partial class Product
{
    public int ProductId { get; set; }

    public string ProductName { get; set; } = null!;

    public string? Description { get; set; }

    public double? Price { get; set; }

    public int? StockQuantity { get; set; }

    public int? CategoryId { get; set; }

    public int? SupplierId { get; set; }

    public virtual ProductCategory? Category { get; set; }

    public virtual Supplier? Supplier { get; set; }
}
