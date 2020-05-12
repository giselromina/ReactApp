import { Component, ChangeDetectionStrategy } from "@angular/core";

import { combineLatest, EMPTY, Subject } from "rxjs";
import { catchError, map, filter, tap } from "rxjs/operators";

import { ProductService } from "../product.service";
import { Product } from "../product";

@Component({
  selector: "pm-product-detail",
  templateUrl: "./product-detail.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent {
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  // Product to display
  product$ = this.productService.selectedProduct$.pipe(
    catchError((err) => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  // Set the page title
  pageTitle$ = this.product$.pipe(
    map((p: Product) => (p ? `Product Detail for: ${p.productName}` : null))
  );

  // Suppliers for this product
  productSuppliers$ = this.productService.selectedProductSuppliers$.pipe(
    catchError((err) => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  // Create a combined stream with the data used in the view
  // Use filter to skip if the product is null
  // esto nose sirve para tener todos los stream en un solo lugar y de alli mismo que se ejecute lo que se necesite
  // por lo tanto implemento un solo async pipe para todos los stream y es mas facil de consumir
  // en el template
  vm$ = combineLatest([this.product$, this.productSuppliers$, this.pageTitle$])
    // el map y la destructuracion de los array permite que se devuelva un observable que tine un objeto
    // compuesto por el producto un array de supplier y el titulo de la pagina
    .pipe(
      filter(([product]) => Boolean(product)),
      map(([product, productSuppliers, pageTitle]) => ({
        product,
        productSuppliers,
        pageTitle,
      }))
    );

  constructor(private productService: ProductService) {}
}
