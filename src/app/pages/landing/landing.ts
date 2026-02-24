import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, ButtonModule, CardModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {}
